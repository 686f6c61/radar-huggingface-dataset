# AeBoPi-0/bird-sql-qwen35-4b-selector-last2

## Resumen

El modelo `AeBoPi-0/bird-sql-qwen35-4b-selector-last2`, publicado por el usuario AeBoPi-0 en Hugging Face, es un ajuste fino de Qwen/Qwen3.5-4B orientado a una tarea muy concreta dentro de los pipelines de text-to-SQL: actuar como selector (reranker) de sentencias SQL candidatas para el benchmark BIRD. No genera SQL desde cero ni responde preguntas en lenguaje natural; su funcion es puntuar la probabilidad de que un candidato SQL sea correcto dado el contexto de la conversacion y el resultado bruto de su ejecucion.

El checkpoint liberado corresponde al paso 633 de un entrenamiento sobre una receta de 3.368 ejemplos, y se presenta como una version preservada sin entrenamiento adicional. La entrada combina la pregunta, la evidencia, los dos ultimos grupos de interaccion del asistente (incluyendo llamadas a herramientas y sus resultados), el SQL candidato final y una previsualizacion de su ejecucion (primeras 10 filas y recuento total de filas). La puntuacion se obtiene mediante el endpoint `/v1/completions` sin plantilla de chat, leyendo el token siguiente y calculando P(Yes) sobre el vocabulario completo.

Es relevante ahora porque ilustra un patron creciente en la investigacion aplicada: modelos pequenos (~4B) especializados mediante ajuste fino para subtareas de un agente mayor, en lugar de un unico modelo monolitico. Su utilidad practica esta acotada al ecosistema BIRD y requiere el codigo acompanante del autor para reproducir el formato exacto. La model card advierte explicitamente de que este checkpoint no se ha evaluado aun en el conjunto de test oculto de BIRD y de que las puntuaciones de test previamente reportadas pertenecen a otro selector distinto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B, tag `qwen3_5`) |
| Parametros totales | 504.320 (segun metadatos de safetensors; el modelo base es de ~4B, dato no coherente con el recuento reportado) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin estado de optimizador) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,1 GB, incluye `file_checksums.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se ajusta mediante fine-tuning supervisado para una tarea de clasificacion binaria disfrazada de generacion: predecir el token siguiente (`Yes`/`No`) como senal de calidad de un SQL candidato. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; lo unico indicado es que la receta consta de 3.368 ejemplos y que este checkpoint corresponde al paso 633.

La innovacion tecnica principal no esta en la arquitectura sino en el protocolo de inferencia: la puntuacion se obtiene con `/v1/completions` sin plantilla de chat, un unico token de salida y P(Yes) calculada sobre el vocabulario completo, sin renormalizacion Yes/No. La seleccion final se realiza sumando P(Yes) dentro de clusters de resultados de ejecucion (esquema S2). Se aplica una politica de longitud heredada: primero `last2`, luego `last1` y, si es necesario, el SQL final real. El autor subraya que este checkpoint no es intercambiable con el selector anterior basado en Qwen3-8B solo para SQL.

## Capacidades

- Puntuacion de SQL candidatos: emite P(Yes) para un candidato dado el contexto conversacional y el preview de ejecucion.
- Reranking en pipelines text-to-SQL: selecciona entre multiples candidatos agrupados por resultado de ejecucion.
- Manejo de contexto de agente: incorpora los dos ultimos grupos de interaccion del asistente, incluidas llamadas a herramientas y sus resultados.
- Uso de evidencia adicional: acepta el campo `evidence` del benchmark BIRD junto a la pregunta.
- Razonamiento sobre resultados de ejecucion: considera las primeras 10 filas y el recuento total de filas del SQL candidato.
- Generacion de texto conversacional: heredada del modelo base, aunque no es el proposito declarado del ajuste.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Tool calling: solo en la medida en que el formato de entrada incluye trazas de llamadas a herramientas; no se documenta soporte nativo de function calling en el ajuste.

## Casos de uso

- Reranking en pipelines BIRD: integrar el modelo como etapa final que puntua cada SQL candidato generado por un LLM mayor, sumando P(Yes) por cluster de resultado de ejecucion para elegir el mas probable.
- Validacion de SQL en produccion: usar la senal P(Yes) como filtro de confianza antes de ejecutar consultas generadas automaticamente contra una base de datos, descartando candidatos por debajo de un umbral.
- Sistemas de agentes con herramientas: aprovechar que la entrada incorpora las dos ultimas interacciones con tool calls para desambiguar consultas en conversaciones multi-turno donde el contexto previo condiciona el SQL correcto.
- Investigacion en text-to-SQL: emplear el checkpoint como componente reproducible (con `file_checksums.json`) para experimentos de seleccion sobre BIRD, comparando politicas de longitud `last2`/`last1`.
- Deteccion de consultas semanticamente erroneas: el preview de ejecucion (filas y recuento) permite al selector penalizar SQL que sintacticamente compila pero devuelve resultados inconsistentes con la pregunta.
- Evaluacion de generadores de SQL: usar el selector como juez auxiliar para comparar distintos modelos generadores sobre el mismo pool de candidatos, siempre que se respete el formato exacto del codigo acompanante.
- Fine-tuning posterior: servir como punto de partida para quien quiera extender la receta a otros dominios o esquemas de bases de datos, dado que se distribuyen los pesos sin estado de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este checkpoint no ha sido evaluado en el conjunto de test oculto de BIRD y que la puntuacion de test previamente reportada corresponde a un selector diferente, por lo que no debe atribuirse a este modelo. Las comparaciones en dev dependen del pool de candidatos y no garantizan mejoras en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 9,1 GB en safetensors, lo que sugiere pesos en precision alta (fp16/bf16) para un modelo de ~4B; en bf16 se requeririan aproximadamente 8-9 GB de VRAM solo para pesos, mas overhead de contexto y KV cache.
- GPU recomendadas: no documentadas por el autor. Por tamano, una GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40 GB) seria suficiente para inferencia en bf16; H100 no seria necesaria.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) en bf16, y en GPUs de 12-16 GB con cuantizacion a 8 bits o 4 bits, aunque no se distribuyen pesos GGUF oficiales.
- Opciones de despliegue: el protocolo de puntuacion requiere un servidor compatible con `/v1/completions` (por ejemplo, vLLM o TGI) sin plantilla de chat; llama.cpp u Ollama requeririan conversion a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles. Al ser un unico token de salida por candidato, la latencia por puntuacion sera baja, pero el coste total depende del numero de candidatos y del pool.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bird-sql-qwen35-4b-selector-last2 | ~4B (base Qwen3.5-4B) | no disponible | Selector/reranker SQL para BIRD | no disponible | Hugging Face, 0 descargas |
| Selector anterior basado en Qwen3-8B (mencionado en la model card) | ~8B | no disponible | Selector SQL (solo SQL) | no disponible | no disponible |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | Generacion de texto general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No evaluado en el test oculto de BIRD: cualquier cifra de test atribuida a este checkpoint seria incorrecta; el autor lo advierte de forma explicita.
- Dependencia del codigo acompanante: el formato de entrada no es estandar y el modelo no es intercambiable con el selector SQL-only anterior de Qwen3-8B.
- Protocolo de inferencia fragil: requiere `/v1/completions` sin plantilla de chat, un unico token y P(Yes) sin renormalizacion; desviarse de este protocolo invalida las puntuaciones.
- Idiomas: solo ingles, lo que limita su uso en pipelines en castellano u otras lenguas sin ajuste adicional.
- Licencia no disponible: no consta permiso explicito de uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Incoherencia en metadatos: el recuento de parametros de safetensors (504.320) no concuerda con el tamano del repo ni con el modelo base de ~4B; conviene validar los pesos antes de usarlos.
- Riesgo de alucinacion y sesgo: no documentados por el autor; al ser un clasificador de un token, el riesgo se traslada a falsos positivos que seleccionen SQL incorrecto.
- Sin datos de entrenamiento ni trazas: no se incluyen ejemplos, preguntas ni SQL de referencia, lo que dificulta la auditoria de sesgos.
- Reproducibilidad limitada: las comparaciones en dev dependen del pool de candidatos y no garantizan mejora en test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AeBoPi-0/bird-sql-qwen35-4b-selector-last2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark BIRD: no disponible en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada
