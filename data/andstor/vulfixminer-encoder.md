# andstor/VulFixMiner-encoder

## Resumen

VulFixMiner-encoder es un modelo de extraccion de caracteristicas (feature extraction) desarrollado por el usuario andstor, disenado especificamente para convertir fragmentos de cambios de codigo (diffs o patches de commits) en representaciones vectoriales densas de 768 dimensiones. Se basa en CodeBERT, el conocido modelo preentrenado de Microsoft sobre codigo fuente y lenguaje natural, y ha sido ajustado sobre el dataset andstor/cvevc_commits, que contiene cambios a nivel de fichero extraidos de commits reales.

El modelo no genera texto ni responde a instrucciones: su unica funcion es producir embeddings semanticos de parches de codigo que sirvan como entrada a un clasificador posterior de seguridad (concretamente, el autor publica un modelo complementario, andstor/vulfixminer-classifier). Resuelve, por tanto, un problema muy concreto dentro del analisis de seguridad de software: representar numericamente un cambio de codigo para poder clasificarlo automaticamente como potencialmente vulnerable o no.

Es relevante por su especializacion: a diferencia de un encoder generico de codigo, este modelo ha sido ajustado sobre commits etiquetados en el contexto de vulnerabilidades (CVE), lo que lo hace adecuado para pipelines de mineria de vulnerabilidades, analisis de pull requests y triaje automatizado de parches. El repositorio ocupa aproximadamente 0,5 GB y se distribuye con la libreria transformers, requiriendo trust_remote_code=True para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en CodeBERT (BERT-base, 12 capas) |
| Parametros totales | no disponible (arquitectura BERT-base, aproximadamente 125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de truncado usada en el ejemplo y en el preprocesado descrito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a codigo fuente; el codigo no depende de idioma natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors / PyTorch (repositorio de transformers, con codigo custom) |

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo BERT-base heredado de CodeBERT: 12 capas de transformer, atencion multi-cabeza y una dimension oculta de 768, que es exactamente la dimensionalidad del embedding de salida que documenta el autor. El modelo no incluye cabeza de clasificacion; se usa como extractor puro, tomando el token [CLS] (primera posicion de last_hidden_state) como representacion del fragmento de codigo.

El ajuste se realizo sobre el dataset andstor/cvevc_commits, del que se extraen cambios a nivel de fichero de commits reales. El autor describe un preprocesado especifico: se eliminan comentarios y cambios vacios, cada fichero se codifica como codigo anadido + sep_token + codigo eliminado, se trunca y rellena a 256 tokens, y para obtener el embedding de un commit completo se calcula la media de los embeddings de primer token de cada fichero, produciendo un vector [1, 768]. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables, en principio, a un encoder de caracteristicas).

## Capacidades

- Extraccion de embeddings densos de 768 dimensiones a partir de diffs o parches de codigo.
- Codificacion conjunta de lineas anadidas y eliminadas mediante el separador del tokenizador, preservando la semantica del cambio.
- Generacion de embeddings a nivel de fichero (truncado a 256 tokens) y a nivel de commit (media de embeddings de fichero).
- Soporte de codigo custom via trust_remote_code, con logica de preprocesado propia del autor.
- Orientado a clasificacion downstream de seguridad (vulnerabilidad si/no) en combinacion con andstor/vulfixminer-classifier.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidades multilingues de lenguaje natural: no disponibles; el dominio es codigo fuente.

## Casos de uso

- Triaje automatizado de pull requests: cada PR se descompone en diffs por fichero, se generan embeddings con este encoder y se pasan al clasificador para marcar cambios con riesgo de introducir vulnerabilidades antes del merge.
- Mineria de vulnerabilidades en historiales de repositorios: procesar commits historicos de un repositorio, calcular embeddings agregados por commit y detectar patrones de parcheo asociados a CVEs para construir datasets o alertas.
- Priorizacion de revisiones de seguridad: en un equipo con volumen alto de commits, ordenar las revisiones por probabilidad de riesgo calculada a partir del embedding, dirigiendo el esfuerzo humano a los cambios mas sospechosos.
- Deteccion de parches incompletos: comparar el embedding de un fix conocido con el de nuevos cambios en la misma zona del codigo para identificar correcciones parciales que dejan la vulnerabilidad abierta.
- Construccion de bases de conocimiento de cambios de seguridad: indexar embeddings de commits en un almacen vectorial para busqueda por similitud de parches ("encuentra cambios similares a este CVE").
- Investigacion academica en seguridad de software: usar el encoder como baseline reproducible para experimentos de clasificacion de commits vulnerables, dado que el dataset y el clasificador complementario son publicos.
- Filtrado en pipelines CI/CD: integrar la extraccion de embeddings como paso previo a un gate de seguridad que bloquee o marque commits con alta probabilidad de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un BERT-base de aproximadamente 125 M de parametros; en FP16, alrededor de 0,5 GB. El tamano del repositorio (0,5 GB) es coherente con pesos en FP32.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una T4 son mas que suficientes para lotes grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; tambien puede ejecutarse en CPU con latencia aceptable para volumenes moderados.
- Opciones de despliegue: transformers (AutoTokenizer + AutoModel con trust_remote_code=True), y potencialmente ONNX Runtime o TorchScript tras exportacion; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un encoder BERT-base con contexto de 256 tokens, el coste por muestra es bajo y el throughput en GPU es alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VulFixMiner-encoder | aprox. 125 M (BERT-base) | 256 tokens | Embeddings de diffs para clasificacion de seguridad | no disponible | Hugging Face (andstor) |
| CodeBERT base (microsoft/codebert-base) | aprox. 125 M | 512 tokens | Embeddings genericos de codigo y lenguaje natural | MIT (segun el modelo original de Microsoft) | Hugging Face |
| GraphCodeBERT (microsoft/graphcodebert-base) | aprox. 125 M | 512 tokens | Embeddings de codigo con estructura de grafo de datos | MIT (segun el modelo original) | Hugging Face |
| UniXcoder (microsoft/unixcoder-base) | aprox. 125 M | 512 tokens | Embeddings y generacion de codigo multitarea | MIT (segun el modelo original) | Hugging Face |

La diferencia principal frente a los encoders genericos de codigo es el ajuste especifico sobre commits etiquetados en el contexto de vulnerabilidades, lo que deberia mejorar la separabilidad en la tarea de clasificacion de seguridad a costa de perder generalidad. La comparativa de rendimiento real no esta disponible porque no se han publicado benchmarks.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas, generar codigo ni mantener conversaciones; cualquier expectativa de ese tipo es incorrecta.
- El contexto efectivo es de 256 tokens por fichero; diffs grandes se truncan, lo que puede perder informacion relevante en cambios extensos.
- El embedding de commit se obtiene por media simple de embeddings de fichero, una agregacion tosca que puede diluir senales en commits con muchos ficheros.
- La licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido; es un riesgo legal a resolver antes de integrarlo en produccion.
- El modelo depende de codigo custom (trust_remote_code=True), lo que implica ejecutar codigo del autor y anade superficie de riesgo en la cadena de suministro.
- Riesgo de sesgo hacia los patrones presentes en andstor/cvevc_commits: si el dataset esta dominado por ciertos lenguajes, proyectos o tipos de CVE, el rendimiento en otros dominios puede degradarse.
- Riesgo de falsos positivos y negativos en la clasificacion downstream; el encoder por si solo no emite un juicio de seguridad, y su utilidad depende del clasificador y del umbral elegido.
- Sin datos publicados de evaluacion, no es posible cuantificar su calidad frente a alternativas; se recomienda validacion propia antes de adoptarlo.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos, con cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andstor/VulFixMiner-encoder
- Clasificador complementario: https://huggingface.co/andstor/vulfixminer-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/andstor/cvevc_commits
- CodeBERT (modelo base): https://huggingface.co/microsoft/codebert-base
